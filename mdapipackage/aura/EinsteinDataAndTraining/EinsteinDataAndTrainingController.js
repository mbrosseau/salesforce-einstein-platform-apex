({
  onLoadDatasets: function(component, event, helper) {
   
    	helper.onLoadDatasets(component);
  },

     getSelectedRow: function(component, event, helper) {
       
         var selectedDatasetId = event.getSource().get("v.name");       
         var datasetList = component.get("v.datasets");  
          
          for (var i = 0; i < datasetList.length; i++) {
       
           	if(datasetList[i].id == selectedDatasetId)  {
            	component.set("v.selectedDataset", datasetList[i] );
           	}
           }
         
     },
    
  messageHandler : function(component, event, helper) {
    console.log("heard new message");
    if (event.getParam("channel") === 'EinsteinDatasetCreation' && event.getParam("message")=== 'newDataset'){
      helper.onLoadDatasets(component);
    }
  },
    handleMenuSelect: function(component, event, helper) {
    	var action  = event.getParam("value");
  		var selectedDatasetId = event.getSource().get("v.name");            
         var datasetList = component.get("v.datasets");  
          
          for (var i = 0; i < datasetList.length; i++) {
           	if(datasetList[i].id == selectedDatasetId)  {
            	component.set("v.selectedDataset", datasetList[i] );
           	}
           }
        
       var datasetCmp = component.find("cDataset");
        
        if(action == "details") {
             datasetCmp.viewDetails();
        } else if(action == "train") {
          	datasetCmp.train();
        } else if(action == "delete") {
            console.log("asking for delete...");
        	datasetCmp.delete();
        }
	}
});