public class EinsteinVisionController {

    @AuraEnabled
    public static Einstein_Dataset[] getCustomModels()
    {
       Einstein_PredictionService service = new Einstein_PredictionService(Einstein_PredictionService.Types.IMAGE);
       Einstein_Dataset[] datasetList = service.getDatasets();
         if (service.httpStatusCode>200) {
                throw new AuraHandledException(service.httpErrorMessage);
            }
        
        
        return datasetList;
    }
    
    @AuraEnabled
    public static Einstein_PredictionResult  analyseImage(String base64Data, String modelName, ID recId , String fileName, String contentType, String keyContent, String email) {

       System.debug('recId' + recId + ' :: fileName ' + fileName + ' :: base64Data :: ' + base64Data.length() + ' :: ContentType :: ' + contentType + ' :: modelName :: ' + modelName );
       System.debug(base64Data.length());
     
        //List<CQB_Vision.Prediction> predictions = CQB_Vision.predictBase64(base64Data, getToken(keyContent, email), modelName);  
        
        Einstein_PredictionService service = new Einstein_PredictionService(Einstein_PredictionService.Types.IMAGE);
        Einstein_PredictionResult result = service.predictImageBase64( modelName, base64Data, 4, null);
        
          if (service.httpStatusCode>200) {
                throw new AuraHandledException(service.httpErrorMessage);
            }
        
        //ID attachementId = CreateAttachmentCtrl.receiveData(recId, fileName, base64Data, contentType);
        
        System.debug(result);
        
       return result;
    }
    
    @AuraEnabled
    public static Id  createRecord(ID recordId, String objectName, String fieldName, String intentLabel) {
       	System.debug(recordId + ' ' + fieldName + ' ' + intentLabel);
       
        sObject sObj = Schema.getGlobalDescribe().get(objectName).newSObject() ;
        sObj.put(fieldName, intentLabel);
    	
        Schema.SObjectType token = recordId.getSObjectType();
        Schema.DescribeSObjectResult dr = token.getDescribe();
       
        String lookupObjectType =  dr.getName();
      	System.debug('Object name ' + objectName  + ' ' + lookupObjectType);
        String lookupName = null;
        
        List<FieldDefinition> fieldList = [Select Label, QualifiedApiName , DataType, FieldDefinition.Publisher.isSalesforce From FieldDefinition where EntityDefinition.QualifiedApiName =: objectName ];
        
        List<String> fieldNames = new List<String>();
        for(FieldDefinition item: fieldList) {
            String name = item.QualifiedApiName ;
            Boolean isSalesforce =  item.Publisher.IsSalesforce;
            
             if((item.DataType.contains('Lookup') ||  item.DataType.contains('Master-Detail') ) && item.QualifiedApiName.contains(lookupObjectType)) {    
            
              	lookupName = name;
                sObj.put(lookupName, recordId);
               // break;
            }
        }

        insert sObj;
    	return sObj.id;
    }
        

    
  /*   public static void createPredictionRecord(String category, Decimal probability, String classifier, ID recId)
    {  
       String modelName = '';
        try {
        	modelName = [SELECT Model_Name__c FROM Einstein_Vision_Model__c WHERE Model_Id__c = :classifier][0].Model_Name__c;
        } catch (Exception e) {
            System.debug('ERROR:' + e);
        }         
        
        Einstein_Vision_Prediction__c prediction = new Einstein_Vision_Prediction__c();
        prediction.Category__c = category;
        prediction.Probability__c = probability;
        
        if (String.isBlank(modelName)) {
        	prediction.Classifier__c = classifier;   
        } else {
            prediction.Classifier__c = modelName;
        }
        
        if (recId != null) {
            prediction.Related_To_ID__C = recId;
        }
        prediction.Classifier_ID__c = classifier;
        insert prediction;
        return prediction; 

    } */
   
    
}