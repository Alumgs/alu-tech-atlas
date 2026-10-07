export type Indicator={id:string;name:string;value:number;unit:string;period:string;source:string;url:string;note:string;history?:{period:string;value:number}[]};
export type ModelQuote={id:string;name:string;context:number;input:number|null;output:number|null;url:string};
export type Indicators={checkedAt:string;indicators:Indicator[];models:ModelQuote[];statuses:{name:string;ok:boolean;error?:string}[]};
