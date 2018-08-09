let form: <%= filename %>;

export function onLoad(executionContext: Xrm.Page.EventContext): void {
    form = new <%= filename %>();
    form.onLoad(executionContext);
}

class <%= filename %> {
    onLoad(executionContext: Xrm.Page.EventContext): void {
        // Define on load events

        // Add on change events

        // Add on save events
    }
}