({  
    onInit: function(component, event, helper) {
       
         var selected = component.get("v.modelName");
        if(selected== null) { 
             selected =  "GeneralImageClassifier";  
             component.set("v.modelName", selected);
            helper.getModels(component);
        }  else {
             component.set("v.selectedModel", selected);
        }
       
       
        
        
        
    },
     
    onDragOver: function(component, event) {
        event.preventDefault();     
    },

    onDrop: function(component, event, helper) {
    	event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        var files = event.dataTransfer.files;
        console.log('files: ' + files[0]);
        if (files.length>1) {
            return alert("You can only analyse one picture at a time");
        }
        component.set("v.probability", "");
        helper.readFile(component, helper, files[0]);
  	},
    
    handleClick: function (component, event, helper){
        helper.createPredictionRecord(component);
    },
    
    onSelectChange : function(component, event, helper) {
      var selected = component.find("levels").get("v.value");
        console.log("selected value: " + selected);
    	component.set("v.modelName", selected);
        if (component.get("v.pictureSrc") != "https://s3-us-west-1.amazonaws.com/sfdc-demo/image-placeholder.png") {
            component.set("v.probability", "");
              var base64Data = component.get("v.fileData").match(/,(.*)$/)[1];
            helper.analyseAgain(component, base64Data);
        }
  },
    onFileSelected : function(component,event,helper) {
      //  document.getElementById("results").style.display = "none";
        var selectedFile = event.target.files[0];
        console.log("SelectedFile ",selectedFile);
        var reader = new FileReader();
       // var imgtag = document.getElementById("myimage");
        //imgtag.title = selectedFile.name;
        //console.log("##Selected File Title ",imgtag.title);
        reader.onload = function(event) {
            imgtag.src = event.target.result;
        };
        component.set("v.probability", "");
      
        helper.readFile(component, helper, selectedFile);
        //reader.readAsDataURL(selectedFile);
},
    handleUploadFinished: function(component, event, helper) {
     //  console.log("upload finished");
        var uploadedFiles = event.getParam("files");
        var contentId = '';
         var modelId = component.get("v.modelName");
        console.log("upload finished " + uploadedFiles.length);
        
        
        for(var i=0; i<uploadedFiles.length; i++) {
           console.log( uploadedFiles[i].name + ' - ' + uploadedFiles[i].documentId );
           contentId =  uploadedFiles[i].documentId;
        }
         component.set("v.attachId", contentId);
        
        helper.analyzeContent(component, contentId);
       
    }

})