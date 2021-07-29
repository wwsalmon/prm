export interface PrmUserObj {
    email: string,
    name: string,
    image: string,
    contactTags: string[],
    noteTags: string[],
}

export interface PrmContactObj {
    prmUserId: string,
    name: string,
    tags: string[],
    description: string,
}

export interface SessionObj {
    user: {
        name: string,
        email: string,
        image: string,
    },
    userId: string,
    username: string,
}

// generic / type alias from https://stackoverflow.com/questions/26652179/extending-interface-with-generic-in-typescript
export type DatedObj<T extends {}> = T & {
    _id: string,
    createdAt: string, // ISO date
    updatedAt: string, // ISO date
}

export type IdObj<T extends {}> = T & {
    _id: string,
}