({
	onUpdateDataset : function(component, event, helper) {
        
        let modelId = component.get('v.modelId');
  
        if(modelId == null) {
            let modelList = component.get('v.models');
            if(modelList == null || modelList.length == 0) {
                return;
            }
            modelId = modelList[0].modelId;
           // component.set('v.modelId', modelId);
        }
            
         let label = component.get('v.label');
        if(label == null) {
            let dataset = component.get('v.dataset');
            let labelList = dataset.labelSummary.labels;
            if(labelList == null || labelList.length == 0) {
                return;
            }
            label = labelList[0].name;
            component.set('v.label', label);
        }
        
        
         component.set("v.intentPhrase", component.find("phrase").get("v.value"));
    
         let action = component.get('c.createFeedbackLanguageExample');
               
        console.log(label + ' ' + modelId);
         console.log(component.get('v.intentPhrase'));
        
        action.setParams({
            
            expectedLabel:  label,
            modelId:  modelId,
            text: component.get('v.intentPhrase')
        })
        action.setCallback(this, function(res){
            let state = res.getState();
            let retVal = res.getReturnValue();
       
            if(state === 'SUCCESS'){ 
                if(retVal){                 
                    component.set('v.predictionList', retVal.probabilities);
                    $A.get("e.force:showToast").setParams({"type" : "success", "message" : "Dataset Updated!"}).fire();
                }
            } else {
                helper.handleErrors(res.getError());
            }
        })
        
        $A.enqueueAction(action);
    },
    modelChanged : function(component, event, helper) {
        console.log("Model changed");
        console.log(component.find("selectedModel").get("v.value"));
        console.log(component.get("v.modelList"));
        component.set("v.modelId", component.find("selectedModel").get("v.value"));
    },
    labelChanged : function(component, event, helper) {
        component.set("v.label", component.find("selectedLabel").get("v.value"));
    }
})