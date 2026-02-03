import type { 
    GalleryInterface, 
    GalleryItemInterface, 
    GridInterface, 
    GridLayoutInterface, 
    ListInterface, 
    ListItemInterface 
} from "~/interfaces/sections.interface";

export const mapToCreateLayoutDto = (layoutElement: GridLayoutInterface) => {
    return {
            'i':layoutElement.i,
            'x':layoutElement.x,
            'y':layoutElement.y,
            'w':layoutElement.w,
            'h':layoutElement.h,
            'type':layoutElement.type,
            'image': layoutElement.image,
            'imageDetail': layoutElement.imageDetail,
            'button': layoutElement.button? {
                '_id':layoutElement.button._id,
                "text": layoutElement.button.text,
                "href": layoutElement.button.href,
                "color": layoutElement.button.color,
                "icon": layoutElement.button.icon,
                "picture": layoutElement.button.picture,
                "iconImageDetail": layoutElement.button.iconImageDetail,
                "pictureImageDetail": layoutElement.button.pictureImageDetail,
            } : null,
            'text':layoutElement.text? {
                '_id':layoutElement.text._id,
                "text": layoutElement.text.text,
                "color": layoutElement.text.color,
            } : null,
            'list': layoutElement.list,
            ...(layoutElement.style && {'style':layoutElement.style}),
    }
}

export const mapToUpdateLayoutDto = (layoutElement: GridLayoutInterface) => {
    return {
            '_id':layoutElement._id,
            'i':layoutElement.i,
            'x':layoutElement.x,
            'y':layoutElement.y,
            'w':layoutElement.w,
            'h':layoutElement.h,
            'type':layoutElement.type,
            'image': layoutElement.image,
            'imageDetail': layoutElement.imageDetail,
            'button': layoutElement.button? {
                '_id':layoutElement.button._id,
                "text": layoutElement.button.text,
                "href": layoutElement.button.href,
                "color": layoutElement.button.color,
                "icon": layoutElement.button.icon,
                "picture": layoutElement.button.picture,
                "iconImageDetail": layoutElement.button.iconImageDetail,
                "pictureImageDetail": layoutElement.button.pictureImageDetail,
            } : null,
            'text':layoutElement.text? {
                '_id':layoutElement.text._id,
                "text": layoutElement.text.text,
                "color": layoutElement.text.color,            
            } : null,
            'list': layoutElement.list,
            ...(layoutElement.style && {'style':layoutElement.style}),
            "status":( layoutElement._id?.length || 0) > 9? 'update' : 'create',
    }
}

export const mapToCreateGridDto = (grid: GridInterface|null) => {
    if(!grid) return null;
    const layouts = grid.breakLine? []:grid.layouts.map(mapToCreateLayoutDto)
    return { 
        "rowHeight": grid.rowHeight, 
        "rows": grid.rows, 
        "columns": grid.columns, 
        "style": grid.style, 
        "color": grid.color,
        "border": grid.border,
        layouts,
        "breakLine": grid.breakLine
    }
}

export const mapToUpdateGridDto = (grid: GridInterface|null) => {
    if(!grid) return null;
    const layouts = grid.breakLine? []:grid.layouts.map(mapToUpdateLayoutDto)
    
    return { 
        "rowHeight": grid.rowHeight, 
        "rows": grid.rows, 
        "columns": grid.columns, 
        "style": grid.style, 
        layouts, 
        "status":( grid._id?.length || 0) > 9? 'update' : 'create',
        "color": grid.color,
        "border": grid.border,
        "breakLine": grid.breakLine
    }
}

export const mapToCreateGridsDto = (grids: GridInterface[]|undefined):GridInterface[]|undefined => {
    if(!grids) return undefined;

    const mappedGrids = grids.map((grid: GridInterface) => {
        const layouts = grid.breakLine? []:grid.layouts.map(mapToCreateLayoutDto)

        return { 
            "rowHeight": grid.rowHeight, 
            "rows": grid.rows, 
            "columns": grid.columns, 
            "style": grid.style,
            "color": grid.color,
            "border": grid.border,
            layouts,
            "breakLine": grid.breakLine
        }
    })
    return mappedGrids;
}

export const mapToUpdateGridsDto = (grids: GridInterface[]|undefined):GridInterface[]|undefined => {
    if(!grids) return undefined;
    const mappedGrids = grids.map((grid: GridInterface) => {
        const layouts = grid.breakLine? []:grid.layouts.map(mapToUpdateLayoutDto)
        
        return { 
            "_id": grid._id,
            "rowHeight": grid.rowHeight, 
            "rows": grid.rows, 
            "columns": grid.columns, 
            "style": grid.style, 
            layouts, 
            "status":( grid._id?.length || 0) > 9? 'update' : 'create',            
            "color": grid.color,
            "border": grid.border,
            "breakLine": grid.breakLine
        }
    })
    return mappedGrids;
}

export const mapToCreateGalleryDto = (gallery: GalleryInterface|null) => {
    if(!gallery) return null;
    if(!gallery.items) return null;
    const items = gallery.items.map((itemElement:GalleryItemInterface) => ({
            'image':itemElement.image,
            'icon':itemElement.icon,            
            'imageDetail':itemElement.imageDetail,
            'iconImageDetail':itemElement.iconImageDetail,
            'title':itemElement.title,
            'video':itemElement.video
        }))
        return { items }
}

export const mapToUpdateGalleryDto = (gallery: GalleryInterface|null) => {
    if(!gallery) return null;
    if(!gallery.items) return null;
    const items = gallery.items.map((itemElement:GalleryItemInterface) => ({
            '_id':itemElement._id,
            'image':itemElement.image,
            'icon':itemElement.icon,
            'imageDetail':itemElement.imageDetail,
            'iconImageDetail':itemElement.iconImageDetail,
            'title':itemElement.title,
            'video':itemElement.video,            
            "status":( itemElement._id?.length || 0) > 9? 'update' : 'create',
        }))
        return { items }
}

export const mapToCreateAccordionDto = (accordion: ListInterface|null) => {
    if(!accordion) return null;
    if(!accordion.items) return null;
    const items = accordion.items.map((itemElement:ListItemInterface) => ({
            'title':itemElement.title,
            'content':itemElement.content
        }))
        return { items }
}

export const mapToUpdateAccordionDto = (accordion: ListInterface|null) => {
    if(!accordion) return null;
    if(!accordion.items) return null;
    const items = accordion.items.map((itemElement:ListItemInterface) => ({
            '_id':itemElement._id,
            'title':itemElement.title,
            'content':itemElement.content
        }))
        return { items }
}