
export interface ILink {
    id: number;
    originalUrl: string;
    shortCode: string;
    userId?: string;
    isActive: boolean;
    validUntil: Date;
    title: string;
    description?: string;
}

export interface IUpdateLink {
    originalUrl?: string;
    isActive?: boolean;
    validUntil?: Date;
    title?: string;
    description?: string;
}

export interface IFindLinkBy {
    id?: number;
    originalUrl?: string;
    shortCode?: string;
    userId?: string;
    isActive?: boolean;
    validUntil?: Date;
    title?: string;
    description?: string;
}

export interface IFindAllLinksBy {
    userId?: string;
    isActive?: boolean;
    validUntil?: Date;
}

export interface IGetLInksBy {
    userId?: string;
    isActive?: boolean;
    validUntil?: Date;
}