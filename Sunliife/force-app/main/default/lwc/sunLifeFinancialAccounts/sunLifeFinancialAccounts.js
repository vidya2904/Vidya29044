// apexContactsForAccount.js
import { LightningElement, wire, api,track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountFinancialController.getAccounts';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FIRSTNAME_FIELD from '@salesforce/schema/Account.Name';
import LASTNAME_FIELD from '@salesforce/schema/Account.Phone';
import ID_FIELD from '@salesforce/schema/Account.Id';


const COLS = [
    { label: 'Name', fieldName: 'ConName', editable: true,sortable: "true" ,type: 'url',
    typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}},
    { label: 'Owner Name', fieldName: 'OwnerName',sortable: "true"},
    { label: 'Phone', fieldName: 'Phone', editable: true },
    { label: 'Website', fieldName: 'Website'},
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue'}

];
export default class SunLifeFinancialAccounts extends LightningElement {

    @api recordId;
    columns = COLS;
    @track data;
    @track error;
    draftValues = [];
    @track sortBy='Name';
    @track sortDirection='asc';
    availableAccounts;
    searchString;
    initialRecords;

    @wire(getAccounts,{field : '$sortBy',sortOrder : '$sortDirection'})
    accounts(result) {
        if (result.data) {
            let tempConList = []; 
            result.data.forEach((record) => {
                let tempConRec = Object.assign({}, record);  
                tempConRec.ConName = '/' + tempConRec.Id;
                tempConList.push(tempConRec);
                
            });
            
            this.data = tempConList;
            this.error = undefined;
            this.availableAccounts = tempConList;
            this.initialRecords = tempConList;
        } else if (result.error) {
            this.availableAccounts = undefined;
            this.error = result.error;
            this.data = undefined;
        }
    }

    handleSearchChange( event ) {

        this.searchString = event.detail.value;
        console.log( 'Updated Search String is ' + this.searchString );

    }

    handleSearch( event ) {

        const searchKey = event.target.value.toLowerCase();
        console.log( 'Search String is ' + searchKey );

        if ( searchKey ) {

            this.availableAccounts = this.initialRecords;
            console.log( 'Account Records are ' + JSON.stringify( this.availableAccounts ) );
            
            if ( this.availableAccounts ) {

                let recs = [];
                
                for ( let rec of this.availableAccounts ) {

                    console.log( 'Rec is ' + JSON.stringify( rec ) );
                    let valuesArray = Object.values( rec );
                    console.log( 'valuesArray is ' + JSON.stringify( valuesArray ) );
 
                    for ( let val of valuesArray ) {

                        console.log( 'val is ' + val );
                        let strVal = String( val );
                        if ( strVal ) {

                            if ( strVal.toLowerCase().includes( searchKey ) ) {

                                recs.push( rec );
                                break;
                        
                            }

                        }

                    }
                    
                }

                console.log( 'Matched Accounts are ' + JSON.stringify( recs ) );
                this.availableAccounts = recs;

             }
 
        }  else {

            this.availableAccounts = this.initialRecords;

        }        
    }
    doSorting(event) {
        // calling sortdata function to sort the data based on direction and selected field
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
    }

    

    handleSave(event) {

        const fields = {}; 
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[FIRSTNAME_FIELD.fieldApiName] = event.detail.draftValues[0].Name;
        fields[LASTNAME_FIELD.fieldApiName] = event.detail.draftValues[0].Phone;

        const recordInput = {fields};

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account updated',
                    variant: 'success'
                })
            );
            // Display fresh data in the datatable
            return refreshApex(this.account).then(() => {

                // Clear all draft values in the datatable
                this.draftValues = [];

            });
        }).catch(error => {
            console.log(JSON.stringify(error));
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or reloading record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}