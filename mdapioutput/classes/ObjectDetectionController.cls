public class ObjectDetectionController {

       @AuraEnabled
   public static Einstein_PredictionResult detectShelfObjects(String modelId, String base64){
        Einstein_PredictionService service = new Einstein_PredictionService(Einstein_PredictionService.Types.IMAGE_DETECTION);
        Einstein_PredictionResult result = service.detectImageBase64(modelId, base64, 0, '');
         if (service.httpStatusCode>200) {
                throw new AuraHandledException(service.httpErrorMessage);
            }
       
       System.debug(result);
        return result;
    } 
    
      @AuraEnabled
    public static void storeScanResults(sObject dataJson, Id recordId, String objectName) {
        
        System.debug('------ Storing Results ----------');
         System.debug('Record - ' + recordId);
         System.debug(dataJson);
   
        Schema.SObjectType token = recordId.getSObjectType();
        Schema.DescribeSObjectResult dr = token.getDescribe();
       
        String lookupObjectType =  dr.getName();
        String lookupName = null;
        
        List<FieldDefinition> fieldList = [Select Label, QualifiedApiName , DataType, FieldDefinition.Publisher.isSalesforce From FieldDefinition where EntityDefinition.QualifiedApiName =: objectName ];
       
        List<String> fieldNames = new List<String>();
        for(FieldDefinition item: fieldList) {
            String name = item.QualifiedApiName ;

            if((item.DataType.contains('Lookup') ||  item.DataType.contains('Master-Detail') ) && item.QualifiedApiName.contains(lookupObjectType)) {       
              	lookupName = name;
                break;
            }
        }
 	  System.debug('Lookup - ' + lookupName + ' ' + lookupObjectType);
      dataJson.put(lookupName, recordId);
       
       insert dataJson; 
    }
    
   
    
}