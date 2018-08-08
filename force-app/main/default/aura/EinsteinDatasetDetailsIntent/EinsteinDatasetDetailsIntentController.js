({
	modelChanged : function(component, event, helper) {
     
        let modelId = component.find("selectedModel").get("v.value");
        
       component.set("v.modelId", modelId);
        
        
        let phrase = component.get('v.intentPhrase');
        if( phrase != null) {
            helper.predict(component, event, helper);
        }
       
    },
    
    predictTextIntent : function(component, event, helper) {
    
          helper.predict(component, event, helper);
    }
   
})