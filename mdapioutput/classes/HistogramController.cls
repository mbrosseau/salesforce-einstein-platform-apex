public class HistogramController {
    
   
     @AuraEnabled
    @Readonly
    @RemoteAction
   public static Map<String, Integer>  getHistogramData(String objectName, String fieldName){
       Integer maxSize =120000;
      
       List<SObject > dataList =  Database.query('SELECT ' + fieldName + ' FROM ' + objectName + ' limit ' + maxSize);
       Map<String, Integer> wordCounts = new  Map<String, Integer>();
       Integer itemCount;
       
        for (Integer i = 0; i < dataList.size() && i < maxSize; i++) {
             SObject  obj = dataList.get(i);
             String value = (String)obj.get(fieldName);
            itemCount = wordCounts.get(value);
            if(itemCount == null) { itemCount =0;}
            
            itemCount++;
             wordCounts.put(value, itemCount);
            
			
        }
       
      
       return wordCounts;
   }
    

}