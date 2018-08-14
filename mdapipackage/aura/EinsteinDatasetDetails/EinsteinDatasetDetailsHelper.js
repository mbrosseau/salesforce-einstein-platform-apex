({
    refreshModelsByDataset: function(component) {
        var helper = this;
        var action = component.get("c.getModels");
        var dataset = component.get("v.dataset");
        if (!dataset.available){
            return;
        }
        var datasetType = dataset.type;
         
        
        console.log("Getting models for dataset " + dataset.id + ".." );
        
        action.setParams({
            datasetId: dataset.id,
            dataType: datasetType
        });
        action.setCallback(this, function(response) {
            //var event = component.getEvent("waitingEvent");
            //event.fire();
            var state = response.getState();
            console.log(response.getReturnValue());
            if (state === "ERROR") {
                var errors = response.getError();
                  helper.handleErrors(errors);
            }
            //Need to handle null response if user clicks tab before
            //training an actual model
            var resp = response.getReturnValue();
            if (resp && resp.length > 0) {
                component.set("v.modelList", resp);

            } else {
                console.log("No model.");
            }
        });
        //var event = component.getEvent("waitingEvent");
        //event.fire();
        $A.enqueueAction(action);
    },
    
    refreshDataset: function(component) {
        //getDataset(Long datasetId, String dataType)
        var action = component.get("c.getDataset");
        var dataset = component.get("v.dataset");
        /*if (!dataset.available){
            console.log("Dataset not available yet");
            return;
        }*/
        var datasetType = dataset.type;
        
        var helper = this;
        
        console.log("Getting models for dataset..");
        
        action.setParams({
            datasetId: dataset.id,
            dataType: datasetType
        });
        action.setCallback(this, function(response) {
            //var event = component.getEvent("waitingEvent");
            //event.fire();
            var state = response.getState();
            console.log(response.getReturnValue());
            if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        alert("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            
            var resp = response.getReturnValue();
            component.set("v.dataset", resp);
          //  helper.getModelsByDataset(component);
             $A.get("e.force:showToast").setParams({"type" : "success", "message" : "Dataset Refreshed!"}).fire();

            
        });
        
        $A.enqueueAction(action);
        
    }
});