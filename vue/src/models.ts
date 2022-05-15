export interface Member {
    id : number;
    name : string;
    avatar : string;
    permissions : UserPermissions;
}
export interface Message {
    id : number;
    content : string;
    author : Member;
    channel : Channel;
    server : Server;
    timestamp : Date;
}
export interface Server {
    id : number;
    name : string;
    icon : string;
}
export interface Channel {
    id : number;
    name : string;
}
export interface Permission {

}
export interface UserPermissions {
    channel : Permission[];
    server : Permission[];
}