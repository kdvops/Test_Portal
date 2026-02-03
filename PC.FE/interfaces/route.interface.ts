export interface ChildrenRoutes {
    path: string
    name: string
    icon?: string
    disabled: boolean
}

export interface Route {
    path?: string
    name: string
    icon?: string
    children?: ChildrenRoutes[];
    disabled: boolean
}
