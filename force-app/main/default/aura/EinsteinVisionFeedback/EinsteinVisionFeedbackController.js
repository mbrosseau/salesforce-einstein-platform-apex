({
    
    doInit : function(component, event, helper) {
            
        //get the userID and store it for possible attachments.  Very cacheable here!
        var action = component.get("c.getMyUserId");
        action.setStorable();
        action.setCallback(this, function (a) {
            var state = a.getState();
            
            if (state === "SUCCESS") {
                //   console.log(a.getReturnValue());
                component.set("v.userId", a.getReturnValue());
            } else if (state === "ERROR") {
                //component.find("leh").passErrors(a.getError());
                console.log(a.getError());
            }
        });
        $A.enqueueAction(action);
        
        var modelId = component.get("v.modelId");
        
        if(modelId == null || modelId.length == 0) {
            var modelList = component.get("v.modelList");
            
            if(modelList != null && modelList.length > 0) {
                modelId = modelList[0].modelId;
                component.set("v.modelId", modelId);
            }
        }
        
    },
    
    sendFeedback : function(component, event, helper) {
        console.log("Send feedback");
        var pictureSrc = component.get("v.pictureSrc");      
        helper.analyze(component, pictureSrc);
        
    },
    onModelChange: function (component, event, helper) {    
        var modelId = component.find("selectModel").get("v.value");
        component.set("v.modelId", modelId);
    },
    onLabelChange: function (component, event, helper) {   
        var label = component.find("selectedLabel").get("v.value");      
        component.set("v.label", label);
    } 
    
})