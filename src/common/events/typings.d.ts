declare namespace Event {
    interface TabEvent<T> {
        component: string
        data: T
    }
}