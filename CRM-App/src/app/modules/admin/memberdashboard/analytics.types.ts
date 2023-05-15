export interface Stores {
  code: string;
  name: string;
}
export interface Tiers {
  id: string;
  name: string;
}
export interface RegisteredMember{
  'type': string;
  'day': number;
  'month': number;
  'year': number;
  'startdate': string;
  'enddate': string;
}
export interface ActivePoint{
  'tier': string;
  'type': string;
  'day': number;
  'month': number;
  'year': number;
  'startdate': string;
  'enddate': string;
}

export interface ExpiredPoint{
  'tier': string;
  'type': string;
  'day': number;
  'month': number;
  'year': number;
  'startdate': string;
  'enddate': string;
}

export interface DateParameter {
  'store': string;
  'type': string;
  'tier': string;
  'day': number;
  'month': number;
  'year': number;
  'startdate': string;
  'enddate': string;
}

export interface EarnPoint {
  'totalEarnPoint': number;
  'totalEarnDolarValue': number;
  'filterShowDate': string;
  'filterShowStartDate': string;
  'filterShowEndDate': string;
  'channel': string;
  'store': string;
  'type': string;
  'day': number;
  'month': number;
  'year': number;
  'startdate': string;
  'enddate': string;
  'tier': string;
}
