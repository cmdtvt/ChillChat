/*
This script handles all actions to general interface management. Switching page's opening modals etc...

Functions that start with Action are something users should be able to use.
UtilityActions are child functions used by other Action functions and should not be callled by users directly.
*/ 


const interfacePageClassName = ".page";
document.addEventListener("DOMContentLoaded",function(){
    ActionInterfacePageHideAll(); //Hide all pages on startup so nothing stupid happens.






    ActionInterfaceSwitchPage("#page-loading");
});

function ActionInterfacePageHideAll() {
    for (let p of document.querySelectorAll(interfacePageClassName)) {
        p.style.display = "none";
    }
}

/*
There might not be any use for this function.
But ill leave it here if there is in some weird case.
*/
function ActionInterfacePageShowAll() {
    for (let p of document.querySelectorAll(interfacePageClassName)) {
        p.style.display = "flex";
    }
}

//This function clears interface management data and registers all pages and interface buttons again. Really should not be used alot can be pretty performance heavy.
function UtilityActionInterfaceReload() {
    //Find all elements with pageTarget datavalue and when clicking them change page.
    for(let t of document.querySelectorAll("[data-pagetarget]")) {
        t.onclick = () => {
            ActionInterfaceSwitchPage(t.dataset.pagetarget);
        }
    }

    for(let t of document.querySelectorAll('.chat-component-server')) {
        t.oncontextmenu = (e) => {
            let x = e.clientX;
            let y = e.clientY;
            console.log([x,y]);
            openContextMenu(x,y,"default","Server",{
                "Home" : [ActionInterfaceSwitchPage,['#page-home']],
                "Menu" : {} 
            });
            e.preventDefault();
        }
        //t.addEventListener("click", function(e){});
    }


}

/*

Open context menu in given location.



*/
function openContextMenu(x,y,type="default",title="untitled menu",binds={}) {
    killChildren(document.querySelector("#contextmenu-wrapper"));

    let contextmenu = document.createElement("div");
    contextmenu.classList.add("contextmenu");
    contextmenu.setAttribute("style","top:"+y+"px; left:"+x+"px;");

    let template_buttons = "";
    for (const [key, value] of Object.entries(binds)) {
        let temp_value = value
        //console.log(typeof(value));

        //Thanks JavaSciprt :)
        //Here we check if object is an array.
        let objType = Object.prototype.toString.call(value);
        if(objType === '[object Array]') {

            let b = document.createElement('div');
            b.classList.add("item");
            let bname = document.createElement('span');
            bname.innerHTML = key;

            //TODO: Currently only passes one parameter to function.
            b.addEventListener("click",function(){
                value[0](value[1]); //Run the passed function and give it parameter.
                killChildren(document.querySelector("#contextmenu-wrapper"));
            });
            b.appendChild(bname);
            contextmenu.appendChild(b);
        } else if(objType === '[object Object]') {
            console.log("Not implemented");
        }


        /*
        if(typeof(value) == "function") {
            let b = document.createElement('div');
            b.classList.add("item");
            let bname = document.createElement('span');
            bname.innerHTML = key;

            b.addEventListener("click",function(){
                value("#page-home");
            });
            b.appendChild(bname);
            contextmenu.appendChild(b);
        }
        */
        
        console.log(key, value);
    }

    /*Template structure for the context menu.*/
    let menu = `
        <div class="contextmenu" style="top:${y}px; left:${x}px;">
            <div class="header">
                <p>${title}</p>
            </div>
            
            ${template_buttons}
            <div class="item hover-content">
                <span>Content</span>
                <div class="content">
                    <div class="item"><span>Button</span></div>
                    <div class="item"><span>Button</span></div>
                    <div class="item"><span>Button</span></div>
                    <div class="item"><span>Button</span></div>
                </div>
            </div>
        </div>
    `;

    document.querySelector("#contextmenu-wrapper").appendChild(contextmenu);


    
}

//Show page by id.
function UtilityActionInterfacePageShow(pageID) {
    document.querySelector(pageID).style.display = "flex";
}

//Hide page by id.
function UtilityActionInterfacePageHide(pageID) {
    document.querySelector(pageID).style.display = "none";
}

//Check if page exsists and if so hide current page and open wanted page.
function ActionInterfaceSwitchPage(pageID) {
    if(document.querySelector(pageID)) {
        ActionInterfacePageHideAll();
        UtilityActionInterfacePageShow(pageID);
        return true;
    }
    console.log("Error opening page with id: "+pageID);
    return false
}

var InterfaceModals = [];

//Create new modal to be displayed in correct format.
function UtilityActionInterfaceModalCreate(title,content,timestamp=null) {
    var data = {
        'title' : title,
        'content' : content,
        'timestamp': timestamp,
        'rendered' : false
    }
    InterfaceModals.push(data);
    return data;
}

//Create new modal DOM elements for data with index in InterfaceModals.
function UtilityActionInterfaceModalOpen(data,anchorID="#modal-wrapper") {

    let title = data.title;
    let content = data.content;
    let timestamp = data.timestamp;


    const modalTemplate = `
        <div class="modal" style="top:20%; left:40%;">
            <div class="title">${title}</div>
            <code>
                ${content}
            </code>
            <span>${timestamp}</span>
            <button class="modal-ok" id="modal-ok">OK</button>
        </div>
    `;




    //FIXME: render below code smarter. Append child can convert to dom element.
    document.querySelector(anchorID).innerHTML += modalTemplate;

}

//Create all modals in interfaceModals where rendered = false
function ActionInterfaceModalOpenUnopened() {

    //TODO: Change the loop so index does need to be calculateed seperatly.
    let temp_index = 0;
    for(const data of InterfaceModals) {
        if(!data['rendered']) {
            data['rendered'] = true;
            UtilityActionInterfaceModalOpen(data,temp_index)
            temp_index += 1;
        }
    }
    console.log("Modals opened: "+temp_index);
    ActionInterfaceModalToggleVisibility("show");
}

//Togles visibility to the wrapper element that ocntains modals. Return true if now visible false if other way around.
function ActionInterfaceModalToggleVisibility(action=null,elementID="#modal-wrapper") {
    var element = document.querySelector(elementID);

    if(action != null) {
        if(action == "show") {
            element.style.display = 'flex';
            return true;
        }
        element.style.display = 'none';
        return false;
        
    } else {
        if(element.style.display == 'none') {
            element.style.display = 'flex';
            return true;
        } else {
            element.style.display = 'none';
            return false;
        }
    }
}



