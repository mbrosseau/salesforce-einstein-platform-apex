public class EinsteinRecordSentimentCtr {

    
      @AuraEnabled
    public static String getRecordName(Id recordId){
         Schema.SObjectType objectName = recordId.getSObjectType(); 
     
        return   objectName.getDescribe().getLabel();
    }
    
    
    @AuraEnabled
    public static List<Einstein_Probability> getRecordAnalysis(Id recordId, String modelId, String fieldName){
        
        System.debug('Getting Sentiment...' + recordId  + ' ' + modelId + ' ' + fieldName);
      
       Schema.SObjectType objectName = recordId.getSObjectType(); 
       SObject recordItem = Database.query('SELECT id, ' + fieldName + ' FROM ' + objectName + ' where id = \'' + recordId + '\' order by id limit 1');
          
        System.debug(recordItem);
        
        String text = (String)recordItem.get(fieldName);
            
         Einstein_PredictionService service = new Einstein_PredictionService(Einstein_PredictionService.Types.SENTIMENT);
      	Einstein_PredictionResult result = null; 
        
            if(modelId == 'Sentiment') {
            	result  = service.predictSentiment('CommunitySentiment',  text, 4, null);
            } else {
                result  = service.predictIntent(modelId,  text, 4, null);
            }
       
          if (service.httpStatusCode>200) {
                throw new AuraHandledException(service.httpErrorMessage);
            }
        
        return result.probabilities;
    } 

     @AuraEnabled
     public static void saveIntent(Id recordId, String fieldName, String value){
     	System.debug(recordId + ' ' + fieldName + ' ' + value);
         
        Schema.SObjectType objectName = recordId.getSObjectType(); 
		 SObject recordItem = Database.query('SELECT id, ' + fieldName + ' FROM ' + objectName + ' where id = \'' + recordId + '\' order by id limit 1');
          
          recordItem.put(fieldName, value);
         System.debug(recordItem);
         update recordItem;
     }
}