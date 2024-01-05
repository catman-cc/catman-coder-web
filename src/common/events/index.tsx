import events from "events";

const EventBus = new events.EventEmitter()

export const Events = {
    Layout: {
        ADD_TAB: "ADD_TAB",
        CLOSE_TAB: "CLOSE_TAB"
    }
}

EventBus.on(Events.Layout.ADD_TAB, (args) => {

})

export default EventBus