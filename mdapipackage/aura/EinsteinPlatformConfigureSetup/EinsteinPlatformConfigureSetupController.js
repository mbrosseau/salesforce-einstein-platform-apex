({
	doInit : function(component, event, helper) {
        helper.getEinsteinSettings(component);
        
        
      
	},
    onCert : function(component, event, helper) {
        var settings  = component.get("v.settings");
        settings.Authentication_Type__c = "certificate";
          component.set("v.settings", settings);
    },
    onPem : function(component, event, helper) {
        var settings  = component.get("v.settings");
        settings.Authentication_Type__c = "pem file";
          component.set("v.settings", settings);
    },
     onCreateCert : function(component, event, helper) {
     },
    testConnect : function(component, event, helper) {
        var showVerify  = component.get("v.showVerify");
        showVerify = true;
        component.set("v.showVerify", showVerify);
        
      
	},
     save : function(component, event, helper) {
        var action = component.get("c.saveSettings");
 		var settings  = component.get("v.settings");
         action.setParams({
      		settings: settings,
    	});
         
    	action.setCallback(this, function(a) {
            if (a.getState() === "SUCCESS") {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "type": "success",
                    "message": "Settings Saved."
                });
                toastEvent.fire();
                
                var checkSettings = component.get("v.checkSettings");
                checkSettings = !checkSettings;
                component.set("v.checkSettings", checkSettings);
                
             	return;
            } else if (a.getState() === "ERROR") {                
    			$A.log("Errors", a.getError());
                helper.handleErrors(a.getError());
            }
   		});

    	$A.enqueueAction(action);
     }
    
})