let form: <%= filename %>;

export function onLoad(xrm?: Xrm.XrmStatic): void {
    form = new <%= filename %>(xrm || Xrm);
    form.onLoad();
}

class <%= filename %> {
    constructor(xrm?: Xrm.XrmStatic) {
        Xrm = xrm || Xrm;
    }

    onLoad(): void {
        // Define on load events

        // Add on change events

        // Add on save events
    }
}