public with sharing class AccountFinancialController {

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(String field, String sortOrder) {
       
        String query;
        String myField = 'Financial Services';
        query  = 'SELECT  Id, Name, Owner.Name, Phone,Website,AnnualRevenue from Account where Industry=:myField';
        if(field != null && sortOrder !=null){
            query += ' ORDER BY '+field+' '+sortOrder;
        }
        system.debug('@##!$#@'+query);
        return Database.query(query);
    }
}