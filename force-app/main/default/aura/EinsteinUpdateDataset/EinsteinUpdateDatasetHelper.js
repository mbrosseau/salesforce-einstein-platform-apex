({
	 updateDatasetWithUrl: function (component) {
        var action = component.get("c.updateDatasetFromUrl");
       // var url = component.find("fileUrl").get("v.value");
        var url = component.get("v.fileUrl");
         var dataset = component.get("v.dataset");
        var dataType = dataset.type;
              
       
        var self = this;
        action.setParams({
            url: url,
            dataType: dataType,
            datasetId: dataset.id
        });
        action.setCallback(this, function (response) {
           
            var state = response.getState();
            if (state === "ERROR") {
                var errors = response.getError();
                 console.log(errors);
                component.find("leh").passErrors(errors);
            } else if (state = "SUCCESS"){
                console.log(response.getReturnValue());
               component.set("v.dataset", response.getReturnValue());
                $A.get("e.force:showToast").setParams({"type" : "success", "message" : "Dataset Updated!"}).fire();
            }
        });
       
        $A.enqueueAction(action);
    },
    setDefaultUrl : function(component) {
        if (component.get("v.dataType") === 'image'){
            component.set("v.fileUrl", "http://einstein.ai/images/mountainvsbeach.zip");
        } else if (component.get("v.dataType") === 'image-multi-label') {
            component.set("v.fileUrl", "http://einstein.ai/images/mountainvsbeach.zip");
        } else if (component.get("v.dataType") === 'text-intent'){
            component.set("v.fileUrl", "http://einstein.ai/text/case_routing_intent.csv");
        } else if (component.get("v.dataType")=== 'image-detection'){
            component.set("v.fileUrl", "https://einstein.ai/images/alpine.zip");
        }
    }
})