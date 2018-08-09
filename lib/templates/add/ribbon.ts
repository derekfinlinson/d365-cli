let ribbon: <%= filename %>;

export function buttonClick(xrm?: Xrm.XrmStatic) {
    ribbon = new <%= filename %>(xrm || Xrm);
    ribbon.buttonClick();
}

class <%= filename %> {
    constructor(xrm? Xrm.XrmStatic) {
        Xrm = xrm || Xrm;
    }
    
    buttonClick() {
        
    }
}