({
    readFile: function (component, event, helper) {
        var files = component.get("v.files");
        if (files && files.length > 0 && files[0] && files[0][0]) {
            var file = files[0][0];
            if (file.size > 5000000) {
                return alert("The file exceeds the limit of 5MB.");
            }
            var reader = new FileReader();
            reader.onloadend = function () {
                var dataURL = reader.result;
                component.set("v.imageURL", null);
                component.set("v.pictureSrc", dataURL);
                helper.upload(component);
            };
            reader.readAsDataURL(file);
        }
    },

    doInit : function(component, event, helper) {

    },

    // for text classification, OR when file/image is already present (and model changes)
    predict : function(component, event, helper) {
        var modelId = component.get("v.modelId");
        
        var phrase = component.get("v.phrase");
         if(phrase == null || phrase.length == 0) {
             return;
         }
        
        if(modelId != null && modelId.length > 0) {
           
             helper.upload(component);
        }
        
     
    },

    //for images from a URL
    predictURL : function(component, event, helper) {
        //set the imageURL for the photo
        component.set("v.files", []);
        component.set("v.pictureSrc", component.get("v.imageURL"));

        helper.upload(component);
    },
    selectTest: function (component, event, helper) {
          component.set("v.selectedMenu", "test");


    },
    selectMass: function (component, event, helper) {
          component.set("v.selectedMenu", "mass");
    }
})