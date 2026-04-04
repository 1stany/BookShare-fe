export interface Trade{
     id?: number,
     requestDate: String ,
     accepted: boolean,
     exchangeDate: String,
     requestedItemName?: String,
     requestingUserFullName?: String,
     exchangedItemName?: String,
     homeUserFullName?: String,
     requestedItemId: number,
     requestingUserEmail: string,
     exchangedItemId: number,
     homeUserEmail: string
}