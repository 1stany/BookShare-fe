export interface ItemForm {
  id?: number;
  name: string;
  description: string;
  activetrade: boolean;
  condition: string;
  conditionComment: string;
  categoryName: string;
  creationDate: string;
  cover?: string;
}
