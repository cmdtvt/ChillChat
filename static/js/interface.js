/*
This script handles all actions to general interface management. Switching page's opening modals etc...

Functions that start with Action are something users should be able to use.
UtilityActions are child functions used by other Action functions and should not be callled by users directly.
*/ 

const interfacePageClassName = ".page";
document.addEventListener("DOMContentLoaded",function(){
    ActionInterfacePageHideAll(); //Hide all pages on startup so nothing stupid happens.
    ActionInterfaceSwitchPage("#page-loading");
    document.querySelector("body").addEventListener("click",function(){
        closeContextMenu();
    });

});

//Hide all pages and hide only subpages if page is defined.
function ActionInterfacePageHideAll(page=null) {
    if (page==null) {
        for (let p of document.querySelectorAll(interfacePageClassName)) {
            p.style.display = "none";
        }
    } else {
        //Hide all pages where their id starts with page-[PAGE]-
        //This is for hiding subpages
        for (let p of document.querySelectorAll("[id^="+page+"-]")) {
            p.style.display = "none";
        }  
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




}

function closeContextMenu() {
    killChildren(document.querySelector("#contextmenu-wrapper"));
}

function openContextMenu(x,y,type="default",title="untitled menu",binds={}) {
    closeContextMenu();





    let contextmenu = document.createElement("div");
    contextmenu.classList.add("contextmenu");
    contextmenu.setAttribute("style","top:"+y+"px; left:"+x+"px;");

    let header = document.createElement('div');
    header.classList.add('header');
    header.innerHTML = title;

    contextmenu.appendChild(header);

    for (const [key, value] of Object.entries(binds)) {
        let func = value;

        let b = document.createElement('div');
        b.classList.add("item");
        let bname = document.createElement('span');
        bname.innerHTML = key;

        b.addEventListener("click",function(){
            func();
            closeContextMenu();
        });
        b.appendChild(bname);
        contextmenu.appendChild(b);
    }
    document.querySelector("#contextmenu-wrapper").appendChild(contextmenu);  

    //Check that context menu does not escape the window.
    let contextElement = document.querySelector(".contextmenu")
    let temp_y = contextElement.style.top
    let temp_x = contextElement.style.left
    let regex = /\d{1,4}/
    temp_y = parseInt(temp_y.match(regex)[0])
    temp_x = parseInt(temp_x.match(regex)[0])
    
    //Move contextmenu so its not outside of the screen.
    if((temp_y+contextElement.clientHeight) > window.innerHeight) {
        temp_y -= contextElement.clientHeight
    }

    if((temp_x+contextElement.clientWidth) > window.innerWidth) {
        temp_x -= contextElement.clientWidth
    }

    document.querySelector(".contextmenu").style.top = temp_y+"px"
    document.querySelector(".contextmenu").style.left = temp_x+"px"
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
        let reg = /(page-[A-Za-z]+)-?([A-Za-z]+)?/;
        let res = pageID.match(reg);
        let [whole,page,subpage] = res;
        console.log(page);

        if(subpage==undefined) {ActionInterfacePageHideAll();} 
        else {ActionInterfacePageHideAll(page);}

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



