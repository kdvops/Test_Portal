export interface LoginRules {
    email: Array<any>
    password: Array<any>
}

export interface CreateCategoryRules {
    name: Array<any>
    slug: Array<any>
    description?: Array<any>
    excerpt?: Array<any>
    tags: Array<any>
}

export interface CreateChannelRules {
    name: Array<any>
    slug: Array<any>
    description?: Array<any>
    excerpt?: Array<any>
    tags: Array<any>
}

export interface CreatePodcastEpisodeRules {
    slug: Array<any>
    title: Array<any>
    description: Array<any>
    link: Array<any>
    season: Array<any>
}

