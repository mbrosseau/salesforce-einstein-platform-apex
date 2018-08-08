({
	onInitChart : function(component, event, helper) {
        
      //  console.log("On init histogram chart");
        
		 var objectName = component.get("v.objectName");
         var fieldName = component.get("v.fieldName");
        
        //  console.log("Init Histogram " + objectName + ' - ' + fieldName);
       // 
        if(objectName == null || objectName.length == 0 || fieldName == null || fieldName.length == 0 ) { return;}
            
 
       
       var action = component.get("c.getHistogramData");      
         action.setParams({     
            objectName: objectName,
             fieldName: fieldName
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state === 'SUCCESS') {
                var returnValue = response.getReturnValue(); 
               console.log("SUCCESS");
               // var values = JSON.stringify(response.getReturnValue());
                var values = response.getReturnValue();
                console.log(values);
             
                 component.set("v.data", values);
                  helper.loadChart(component, event, helper);
                 var rendered = component.get("v.rendered");
                if(!rendered) {
                  
                    component.set("v.rendered", true);
                    
                } else {
                    
                }
               
		;
            } else if(state === 'ERROR') {
                 var errors = action.getError();
             //   alert(errors[0].message);
               $A.log("Errors", errors);
                helper.handleErrors(errors);
            }
        });
        $A.enqueueAction(action);
       
	}
})