({  
    onInit: function(component, event, helper) {
       
        helper.getModels(component);
        
        if(component.get("v.modelName") == '') {
            console.log("Empty Model");
            var selected = component.find("levels").get("v.value");
           
            component.set("v.modelName", selected);  
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
            helper.analyseAgain(component)
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
}

})