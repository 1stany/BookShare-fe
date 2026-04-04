export interface Item {
  id?: number;
  name: string;
  description: string;
  activetrade: boolean;
  condition: string;
  conditionComment?: string;
  categoryName: string;
  creationDate?: string;
  ownerCityName?: string;
  ownerName?: string;
  ownerEmail: string;
  cover?: string;
}
