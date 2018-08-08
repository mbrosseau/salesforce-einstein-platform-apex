({
	getModelId : function(component) {
		 let chosenModelId = component.get('v.modelId');
        if(chosenModelId == null) {
            let modelList = component.get('v.modelList');
            if(modelList == null || modelList.length == 0) {
                return;
            }
            chosenModelId = modelList[0].modelId;
            component.set('v.modelId', chosenModelId);
        }
        return chosenModelId;
	},
    predict : function(component, event, helper) { 
     	let chosenModelId = helper.getModelId(component);
        
        let phrase = component.find("phrase").get("v.value");
        component.set("v.intentPhrase", phrase);
        
        let action = component.get('c.predictIntent');
               
        action.setParams({
            
            modelId:  chosenModelId,
            phrase: phrase
        })
        action.setCallback(this, function(res){
            let state = res.getState();
            let retVal = res.getReturnValue();
       
            if(state === 'SUCCESS'){        
                if(retVal){
                    let predictionList =  retVal.probabilities;
                    component.set('v.predictionList', predictionList);
                }
            } else {
               helper.handleErrors(res.getError());
            }
        })
        
        $A.enqueueAction(action);
    }
})