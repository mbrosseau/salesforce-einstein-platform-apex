public class Einstein_PlaygroundController {

    public static Einstein_PredictionService service;
    public static final integer EXPIRY = 5;
    public static final string CD_TEMP_PREFIX = 'EinsteinTemp';

    private static void setType(String dataType) {
        if (service==null) {
            service = new Einstein_PredictionService(Einstein_PredictionService.Types.IMAGE);
        }
        if (dataType=='image') {
            service.setType(Einstein_PredictionService.Types.IMAGE);
        } else if (dataType=='image-detection') {
            service.setType(Einstein_PredictionService.Types.IMAGE_DETECTION);
        } else if (dataType=='image-multi-label') {
            service.setType(Einstein_PredictionService.Types.IMAGE_MULTI_LABEL);
        } else if (dataType=='text-intent') {
            service.setType(Einstein_PredictionService.Types.INTENT);
        } else if (dataType=='text-sentiment') {
            service.setType(Einstein_PredictionService.Types.SENTIMENT);
        }
    }

    @AuraEnabled
    public static id getMyUserId(){
        return UserInfo.getUserId();
    }
  
    @AuraEnabled
    public static String getModelMetrics(string modelId, string dataType){
        try {
        setType(dataType);
        String metrics = service.getModelMetrics(modelId);
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return metrics;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String getLearningCurves(string modelId, string dataType){
        try {
        setType(dataType);
        String curves = service.getModelLearningCurve(modelId);
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return curves;
             } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Einstein_ApiUsage> getUsage() {
         try {
        setType('image'); //default
        List<Einstein_ApiUsage> usage = service.getApiUsage();
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return usage;
         } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static void saveSettings(Einstein_Settings__c settings){
        
        if(settings.id == null) {
            Einstein_Settings__c existingSettings = Einstein_Settings__c.getOrgDefaults();
			settings.id = existingSettings.id;
        }
        
        if(settings.id == null)  {
              insert settings;
        } else {
              update settings;
        }  
    }
    
       @AuraEnabled
    public static String updateFile(String documentId){
        String fileName = null;
       
         ContentDocument base64Content;
         base64Content = [SELECT id, Title FROM ContentDocument  where id=: documentId LIMIT 1];
        
        fileName = base64Content.Title;
      
        return fileName;
    }
    
         @AuraEnabled
    public static void linkCertficate(String certName){
       
      
        
    }
    
   @AuraEnabled
    public static Map<String, String> validateSetup() {
        Map<String, String> setupInfo = new  Map<String, String>();
        String status = 'Working';
        String message = null;
        
		// double check settings are complete
		 Einstein_Settings__c settings = Einstein_Settings__c.getOrgDefaults();
        
        if(settings.Einstein_EMail__c ==  null) {
            status = 'Configuration Incomplete';
            message = 'Please enter the Einstein Platform Account email address';
        }
        
         if(settings.CertName__c  ==  null) {
            status = 'Configuration Incomplete';
            message = 'Please ensure the authentication settings have been completed.';
        }

        
        // make an outbound call
        try {
        setType('image'); //default
            List<Einstein_ApiUsage> usage = service.getApiUsage();
            if (service.httpStatusCode>200) {
                status = 'Connection Error';
           		 message = service.httpErrorMessage;
            }
       
        } catch(Exception e) {
            status = 'Connection Error';
            message = e.getMessage();
             
        }
        
        setupInfo.put('status', status);
         setupInfo.put('message', message);
        
        return setupInfo;
    }
        
     @AuraEnabled
    public static String getPemFileId(){
        Einstein_Settings__c settings = Einstein_Settings__c.getOrgDefaults();

 		String tokenFileName = settings.CertName__c;
	         
                if (settings.Authentication_Type__c  == 'pem file') {       
                   List<ContentDocument> base64Content;
                    // Try to retrieve certificate
                    
                    try {
                        base64Content = [SELECT id FROM ContentDocument  where Title=: tokenFileName order by CreatedDate DESC LIMIT 1];
                        if(base64Content.size() > 0) {
                             return base64Content.get(0).id;
                        }
                       return null;
                    } catch (QueryException e) {
                        throw new Einstein_ConfigurationException('Could not retrieve the Einstein Platform certificate file: ' + tokenFileName , e);
                    }  
                }
        
        return null;
    }
    
    @AuraEnabled
    public static void createDatasetFromUrl(String url, String dataType) {
         try {
        setType(dataType);
        service.createDatasetFromUrlAsync(url);
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Einstein_Example createFeedbackLanguageExample(String expectedLabel, String modelId, String text) {
        try {
        setType('text-intent');
        Einstein_Example example = service.createFeedbackLanguageExample( expectedLabel,  modelId,  text);
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return example;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }
    
   @AuraEnabled
    public static Einstein_Example createVisionExample(String name, String expectedLabel, String modelId, String url ) {
        try {
        setType('image');
        System.debug('Create Example - ' + modelId + ' ' + expectedLabel + ' ' + name + ' ');
        url = 'https://s3-us-west-2.amazonaws.com/sdodemo-main-15d/slider-4-2.jpg';
        Einstein_Example example = service.createFeedbackImageExample( name,  expectedLabel,  modelId,  url);
         if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return example;
         } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }

    }
    
    @AuraEnabled
    public static Einstein_Dataset updateDatasetFromUrl(Long datasetId, String url, String dataType) {
        try {
        setType(dataType);
        System.debug('Create Example - ' + datasetId + ' ' + dataType + ' ' + url + ' ');
      
        Einstein_Dataset dataset = service.createExamplesFromUrl( datasetId,  url);
         if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return dataset;
         } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }

    }
    
    @AuraEnabled
    public static List<Einstein_Dataset> getDatasets(String dataType) {
        try {
        setType(dataType);
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
           
        List<Einstein_Dataset> datasets = service.getDatasets();
        
        List<Einstein_Dataset> datasetsReturn = new List<Einstein_Dataset>();
        for (Einstein_Dataset dataset : datasets) {
            if (dataset.type==dataType) {
                datasetsReturn.add(dataset);
            }
        }
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return datasetsReturn;
        } catch (Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }        
            
    }
    
     @AuraEnabled
    public static Einstein_Dataset getDataset(Long datasetId, String dataType) {
        try {
        Einstein_Dataset dataset = null;
        try {
            
            System.debug(datasetId + ' ' + dataType);
            
        	setType(dataType);
                  
        	 dataset =  service.getDataset( datasetId);
            
        } catch (Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }    
        
        if (service.httpStatusCode>200) {
                throw new AuraHandledException(service.httpErrorMessage);
          }
         
        return dataset;
         } catch (Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }  
            
    }

    @AuraEnabled
    public static List<Einstein_Model> getModels(Long datasetId, String dataType) {
         try {
        setType(dataType);
        Einstein_Model[] models = service.getModels(datasetId);
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return models;
         } catch (Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }  
    }

    @AuraEnabled
    public static String trainDataset(Decimal datasetId, String modelName, String dataType) {
        
        try {
        
        setType(dataType);
        Einstein_Model model = service.trainDataset(datasetId.longValue(), modelName, 0, 0, null);
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return model.modelId;
        }  catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String retrainDataset(String modelId, String dataType) {
           try { 
        System.debug(dataType);
        setType(dataType);
        Einstein_Model model = service.retrainDataset(modelId, 10, 0, null);
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return model.modelId;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteDataset(Long datasetId, String dataType) {
         
         try {
        setType(dataType);
        service.deleteDataset(datasetId);
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Einstein_PredictionResult predictImageClassification(String modelId, String base64) {
        try {
        System.debug(modelId + ' ' + base64.length());
        
        setType('');
        service.setType(Einstein_PredictionService.Types.IMAGE);
        Einstein_PredictionResult result = service.predictImageBase64(modelId, base64, 0, '');
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return result;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Einstein_PredictionResult predictImageClassificationURL(String modelId, String url) {
        try {
        setType('');
        service.setType(Einstein_PredictionService.Types.IMAGE);
        Einstein_PredictionResult result = service.predictImageUrl(modelId, url, 0, '');
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return result;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Einstein_PredictionResult predictImageDetection(String modelId, String base64) {
         try {
        setType('');
        service.setType(Einstein_PredictionService.Types.IMAGE_DETECTION);
        Einstein_PredictionResult result = service.detectImageBase64(modelId, base64, 0, '');
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return result;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Einstein_PredictionResult predictImageDetectionURL(String modelId, String url) {
        try {
        setType('');
        service.setType(Einstein_PredictionService.Types.IMAGE_DETECTION);
        Einstein_PredictionResult result = service.detectImageUrl(modelId, url, 0, '');
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return result;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }



    @AuraEnabled
    public static Einstein_PredictionResult predictIntent(String modelId, String phrase) {
        try {
        setType('');
        service.setType(Einstein_PredictionService.Types.INTENT);
        Einstein_PredictionResult result = service.predictIntent(modelId, phrase, 0, '');
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return result;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Einstein_PredictionResult predictSentiment(String modelId, String phrase) {
        try {
        setType('');
        service.setType(Einstein_PredictionService.Types.SENTIMENT);
        Einstein_PredictionResult result = service.predictSentiment(modelId, phrase, 0, '');
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return result;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

     @AuraEnabled
    public static  Einstein_Example[] getExamples(Long datasetId, String dataType, Integer count, Integer offset) {
           try {  
        setType(dataType);
        Einstein_Example[] result = service.getExamples(datasetId,  count, offset, Einstein_Example.Types.ALL) ;
        
      
        if (service.httpStatusCode>200) {
            throw new AuraHandledException(service.httpErrorMessage);
        }
        return result;
        } catch(Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
  
	}
    
    
    @AuraEnabled
    public static Einstein_Settings__c getSettings() {
        Einstein_Settings__c settings = Einstein_Settings__c.getOrgDefaults();
        return settings;
    }
    
    @AuraEnabled
    public static Map<String, Boolean> validateEinsteinPlatformSetup() {
        Map<String, Boolean> mapSettings = new Map<String, Boolean>();
        Einstein_Settings__c settings = Einstein_Settings__c.getOrgDefaults();
        if (settings.Einstein_EMail__c == null) {
            mapSettings.put('einsteinEmail', false);
        } else {
            mapSettings.put('einsteinEmail', true);
        }
        if (settings.CertName__c == null) {
            ContentVersion base64Content;
            // Try to retrieve certificate
            try {
                base64Content = [SELECT Title, VersionData FROM ContentVersion where Title='einstein_platform' AND IsLatest=true LIMIT 1];
            } catch (QueryException e) {
                mapSettings.put('einsteinCert', false);
            }
        } else {
            mapSettings.put('einsteinCert', true);
        }
        return mapSettings;
    }


    // stuff related to dataset generation
    @AuraEnabled
	public static string getObjectOptions(){

		Map<String, Schema.SObjectType> objects = Schema.getGlobalDescribe();

		list<map<string, string>> output = new list<map<string, string>>();
		for (string s:objects.keySet()){
			DescribeSObjectResult dsor = objects.get(s).getDescribe();
			if (
				//if you can't update anything, you won't be able to save a prediction anywhere!
				dsor.isUpdateable() &&
				!dsor.isCustomSetting() //no custom settings
			) {
				map<string, string> tempMap = new map<string, string>();
				if (dsor.getLabel() != dsor.getName()){
					tempMap.put('label', dsor.getLabel() + ' (' + dsor.getName() + ')');
				} else {
					tempMap.put('label', dsor.getLabel());
				}
				tempMap.put('name', dsor.getName());
				output.add(tempMap);
			}

		}
		system.debug(output);
		return JSON.serialize(output);
	}

    /*for a given object, return the fields that are sources of text (string, textarea) or labels (picklist, boolean)*/
	@AuraEnabled
	public static string getObjectFields(string objectName, string sourceOrLabel){
		list<string> temp = new list<string>();
		temp.add(objectName);

		List<Schema.DescribeSObjectResult> describe = Schema.describeSObjects(temp);

		map<string, Schema.SObjectField> fieldmap = describe[0].fields.getMap();

		list<map<string, string>> output = new list<map<string, string>>();

		for (Schema.SObjectField field:fieldmap.values()){
			DescribeFieldResult dfr = field.getDescribe();
			if (
					(sourceOrLabel=='Source'
							&& (dfr.getType().name()=='String' || dfr.getType().name()=='TextArea')
					) ||
					(sourceOrLabel=='Label'
							&& (dfr.getType().name()=='Picklist' || dfr.getType().name()=='Boolean')
					)
			){
				map<string, string> tempMap = new map<string, string>();
				if (dfr.getLabel() != dfr.getName()){
					tempMap.put('label', dfr.getLabel() + ' (' + dfr.getName() + ')' + ' [' + dfr.getType().name() + ']');
				} else {
					tempMap.put('label', dfr.getLabel() + ' [' + dfr.getType().name() + ']');
				}
				tempMap.put('name', dfr.getName());
				tempMap.put('type', dfr.getType().name());
				output.add(tempMap);
			}
		} //end for loop of fieldmap

		system.debug(output);
		return JSON.serialize(output);
	}

    @AuraEnabled
	public static ContentVersion saveFileToFiles(string obj, string src, string classify){

		ContentVersion CV = new ContentVersion();
		CV.VersionData = blob.valueof(makeCSV(obj, src, classify));

		CV.PathOnClient = obj +'-' + classify + '.csv';
		CV.Title = obj +'_' + classify + '_by_' + src;

		insert CV;
        //requery to get contentdocumentID that was created
		ContentVersion CV2 = [select id, Title, ContentDocumentId from ContentVersion where id=: CV.id];
		return CV2;

	}

    @AuraEnabled
    public static ContentDistribution writeCD(id contentDocumentId, string name){

        ContentVersion CV = [select id from ContentVersion where ContentDocumentId =: contentDocumentId and isLatest = true];
		ContentDistribution CD = new ContentDistribution();
		CD.ContentVersionId = CV.Id;
      
        if(name.length() > 10 ) { name = name.left(10);}
        
		CD.Name = CD_TEMP_PREFIX + name;
		CD.PreferencesAllowOriginalDownload = true;
		CD.PreferencesLinkLatestVersion = true;
		CD.ExpiryDate = system.now().addMinutes(EXPIRY);
		CD.PreferencesExpires = true;
		CD.PreferencesNotifyOnVisit = false;
		CD.PreferencesNotifyRndtnComplete = false;
		insert CD;

        ContentDistribution CD2 = [select id, ContentDownloadUrl from ContentDistribution where Id =: cd.Id];
		return CD2;
	}

    	//for long text areas with newlines, get rid of them so they don't confuse the file or the learning
	public static string csvLineClean(string input){
		string output = input;
		output = output.replaceAll('\\r\\n', ' ');
		output = output.replaceAll('\\n', ' ');
		output = output.replaceAll('\"', '\'');
		return output;
	}

	public static string makeCSV (string obj, string src, string classify){
		string query = 'select ' +src+ ', ' +classify+ ' from ' +obj+ ' where ' + classify + '!= null limit 50000';

		list<sobject> data = database.query(query);

        //null check
        if (data.isEmpty()){
            throw new AuraHandledException('There is no valid data for that object and those fields');
        }
		list<string> lines = new list<string>();

		for (sobject so:data){
			system.debug(so);
			if ((string)so.get(src)!=null){ //filter for null src field here, since we can't avoid them in SOQL where
				string thisLine = '"' + csvLineClean((string)so.get(src)) + '",' + '"' + csvLineClean((string)so.get(classify)) + '"';
				lines.add(thisLine);
			}
		}

		string csv = string.join(lines, '\n');

		system.debug(csv);
		return csv;
	}

    @future
    // expires publicly shared files that have already been accessed.  @future to avoid impacting users with DML stuff
    public static void handleCDV (list<ID> CDIDs){
        list<ContentDistribution> CDs = [select name, ExpiryDate from ContentDistribution where id in: CDIDs];
        for (ContentDistribution CD:CDs){
            if (CD.Name.startsWith(CD_TEMP_PREFIX)){
                CD.ExpiryDate = system.now();
            }
        }
        update CDs;
    }

}