export type MetricInfo = {
  id: number | string;
  params: Record<string, any>;
  queryFunc: Function;
  trend: boolean;
  for: Array<string>;
};
