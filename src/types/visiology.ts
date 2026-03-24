// ============================================================
// Visiology Dashboard Theme JSON Schema — TypeScript interfaces
// Based on: Visiology.DashboardService.Modules.Dashboards.Domain.Models
// ============================================================

export interface VisiologyTheme {
  $type: string;
  Name: string;
  WidgetStyles: TypedList<WidgetBase>;
}

export interface TypedList<T> {
  $type: string;
  $values: T[];
}

// ---- Primitives ----

export interface Position {
  $type: string;
  X: number;
  Y: number;
}

export interface Size {
  $type: string;
  Width: number;
  Height: number;
}

export interface NullableSize {
  $type: string;
  Width: number | null;
  Height: number | null;
}

export interface GradientColor {
  $type: string;
  ColorStart: string | null;
  ColorEnd: string | null;
}

export interface ColorStyle {
  $type: string;
  ColorType: number | null;
  Color: string | null;
  GradientColor: GradientColor;
}

export interface Background {
  $type: string;
  Enabled: boolean | null;
  Color: ColorStyle;
}

export interface TextStyle {
  $type: string;
  Color: string;
  FontSize: number;
  FontFamily: string;
  Align: number;
  VerticalAlign: number;
  LineHeight: number;
  IsBold: boolean;
  IsItalic: boolean;
}

export interface BorderStyle {
  $type: string;
  Color: ColorStyle;
  Width: number;
  Enabled: boolean;
}

export interface FrameStyle {
  $type: string;
  Radius: number;
  ColorType: number;
  Color: string;
  GradientColor: GradientColor;
}

export interface Frame {
  $type: string;
  Enabled: boolean;
  Style: FrameStyle;
}

export interface BoxShadow {
  $type: string;
  X: number;
  Y: number;
  Blur: number;
  Spread: number;
  Color: string;
}

export interface Title {
  $type: string;
  Enabled: boolean;
  AutoSize: boolean;
  Text: string | null;
  Link: string | null;
  LinkEnabled: boolean;
  Background: Background;
  TextStyle: TextStyle;
  Size: NullableSize;
}

export interface WidgetColor {
  $type: string;
  Id: string;
  Value: string;
}

export interface NumberFormat {
  $type: string;
  Precision: number;
  UseGrouping: boolean;
  GroupSeparator: string;
}

// ---- Widget Base ----

export interface WidgetBase {
  $type: string;
  Type: string;
  Position: Position;
  PositionLocked: boolean;
  Size: Size;
  Title: Title;
  Metadata: unknown;
  Frame: Frame;
  Background: Background;
  BoxShadow: BoxShadow;
  ZIndex: number;
  AllowExport: boolean;
  AllowSort: boolean;
  MultiselectEnabled: boolean;
  ColorPalette: TypedList<WidgetColor>;
  UseCustomColors: boolean;
  DrilldownEnabled: boolean;
  CodeEditableEnabled: boolean;
  NumberFormat: NumberFormat;
  HasFilterInByNullValue: boolean;
  [key: string]: unknown;
}

// ---- Chart axis / legend / labels ----

export interface ZoomHandleStyle {
  $type: string;
  Color: string;
}

export interface ZoomLineStyle {
  $type: string;
  Color: string;
  Opacity: number;
}

export interface ZoomAreaStyle {
  $type: string;
  Color: string;
  Opacity: number;
}

export interface ZoomDataBackground {
  $type: string;
  LineStyle: ZoomLineStyle;
  AreaStyle: ZoomAreaStyle;
}

export interface ZoomStyle {
  $type: string;
  FillerColor: string;
  BackgroundColor: string;
  MoveHandleSize: number;
  HandleStyle: ZoomHandleStyle;
  MoveHandleStyle: ZoomHandleStyle;
  DataBackground: ZoomDataBackground;
  SelectedDataBackground: ZoomDataBackground;
}

export interface AxisTitle extends Title {
  Distance: number;
}

export interface Labels {
  $type: string;
  Enabled: boolean;
  Formatter: string | null;
  TextStyle: TextStyle;
  RotationMode: number;
  RotationAngle: number;
}

export interface Grid {
  $type: string;
  Enabled: boolean;
}

export interface YAxis {
  $type: string;
  Enabled: boolean;
  LineEnabled: boolean;
  ZoomEnabled: boolean;
  ZoomStyle: ZoomStyle;
  IsLogarithmic: boolean;
  ShowOnlyIntValues: boolean;
  LogarithmicTickInterval: number;
  Title: AxisTitle;
  Labels: Labels;
  Grid: Grid;
  Min: number | null;
  Max: number | null;
  Interval: number | null;
  PlotLines: TypedList<unknown>;
  PlotBands: TypedList<unknown>;
}

export interface XAxis {
  $type: string;
  Enabled: boolean;
  LineEnabled: boolean;
  ZoomEnabled: boolean;
  ZoomStyle: ZoomStyle;
  Title: AxisTitle;
  Labels: Labels;
  Grid: Grid;
}

export interface Legend {
  $type: string;
  Enabled: boolean;
  TextStyle: TextStyle;
  HorizontalAlign: number;
  VerticalAlign: number;
  Layout: number;
}

export interface DataLabels {
  $type: string;
  Enabled: boolean;
  TextStyle: TextStyle;
  AllowOverlap: boolean;
}

export interface Tooltip {
  $type: string;
  HeaderEnabled: boolean;
  TextStyle: TextStyle;
}

export interface SelectStyleBorder {
  $type: string;
  Border: BorderStyle;
}

export interface UnselectStyle {
  $type: string;
  Transparency: number;
}

export interface Column {
  $type: string;
  Width: number;
  Padding: number;
  IsGrouping: boolean;
  SelectStyle: SelectStyleBorder;
  UnselectStyle: UnselectStyle;
}

export interface StackedLabel {
  $type: string;
  Enabled: boolean;
  TextStyle: TextStyle;
}

export interface Series {
  $type: string;
  TextStyle: TextStyle;
}

// ---- Chart widgets ----

export interface BarChartWidget extends WidgetBase {
  Type: 'BarChart' | 'HighchartsBarChart';
  IsManualColumnSettings: boolean;
  Column: Column;
  StackedLabel: StackedLabel;
  IsStacking: boolean;
  Legend: Legend;
  YAxis: YAxis;
  YAxisOpposite: YAxis;
  XAxis: XAxis;
  Series: Series;
  DataLabels: DataLabels;
  Tooltip: Tooltip;
  NullDataHandling: number;
}

export interface ChartWidget extends WidgetBase {
  Type: 'Chart' | 'HighchartsChart';
  DefaultLineWidth: number;
  Legend: Legend;
  YAxis: YAxis;
  YAxisOpposite: YAxis;
  XAxis: XAxis;
  Series: Series;
  DataLabels: DataLabels;
  Tooltip: Tooltip;
  NullDataHandling: number;
}

export interface ColumnChartWidget extends WidgetBase {
  Type: 'ColumnChart' | 'HighchartsColumnChart';
  IsManualColumnSettings: boolean;
  Column: Column;
  StackedLabel: StackedLabel;
  IsStacking: boolean;
  Legend: Legend;
  YAxis: YAxis;
  YAxisOpposite: YAxis;
  XAxis: XAxis;
  Series: Series;
  DataLabels: DataLabels;
  Tooltip: Tooltip;
  NullDataHandling: number;
}

export interface PieDataLabels {
  $type: string;
  Enabled: boolean;
  TextStyle: TextStyle;
  AllowOverlap: boolean;
  ShowPercentage: boolean;
  ShowValue: boolean;
  ShowCategory: boolean;
}

export interface CenterTitle {
  $type: string;
  Enabled: boolean;
  Text: string | null;
  TextStyle: TextStyle;
}

export interface PieChartWidget extends WidgetBase {
  Type: 'PieChart' | 'HighchartsPieChart';
  CircleSize: number;
  CircleInnerSize: number;
  CenterTitle: CenterTitle;
  Legend: Legend;
  Series: Series;
  PieDataLabels: PieDataLabels;
  Tooltip: Tooltip;
  DataLabelsFormatter: string | null;
}

export interface CategoryLabels {
  $type: string;
  Enabled: boolean;
  TextStyle: TextStyle;
}

export interface TreemapWidget extends WidgetBase {
  Type: 'Treemap' | 'HighchartsTreemap';
  Series: Series;
  SeriesBorderWidth?: number;
  Legend?: Legend;
  DataLabels: DataLabels;
  CategoryLabels: CategoryLabels;
  Tooltip: Tooltip;
  LayoutAlgorithm?: string;
}

export interface GaugeDial {
  $type: string;
  BackgroundColor: string;
  BorderColor: string;
  BorderWidth: number;
  BaseLength: string;
  BaseWidth: number;
  Radius: string;
  RearLength: string;
  TopWidth: number;
}

export interface GaugeDataLabels {
  $type: string;
  Enabled: boolean;
  TextStyle: TextStyle;
}

export interface AxisLabels {
  $type: string;
  Enabled: boolean;
  Distance: number;
  TextStyle: TextStyle;
}

export interface TargetValue {
  $type: string;
  Enabled: boolean;
  Color: string;
  Length: number;
  Width: number;
}

export interface GaugeWidget extends WidgetBase {
  Type: 'Gauge' | 'HighchartsGauge';
  InnerRadius: number;
  OuterRadius: number;
  Padding?: number;
  BackgroundColor: string;
  FillColor: string | null;
  Dial: GaugeDial;
  GaugeDataLabels: GaugeDataLabels;
  AxisLabels: AxisLabels;
  TargetValue: TargetValue;
}

// ---- Table widgets ----

export interface DataGridHeader {
  $type: string;
  WordWrapEnabled: boolean;
  FormattingEnabled: boolean;
  TextFormatter: string;
  TextStyle: TextStyle;
  Background: string;
}

export interface DataGridBody {
  $type: string;
  FormattingEnabled: boolean;
  AutoAlignEnabled: boolean;
  TextFormatter: string;
  TextColorFormatter: string;
  BackgroundFormatter: string;
  WordWrapEnabled: boolean;
  RowAlternationEnabled: boolean;
  RowAlternationColor: string;
  SelectedRowBackgroundColor: string | null;
  Formatter: string | null;
  TextStyle: TextStyle;
  Background: string;
}

export interface DataGridTotal {
  $type: string;
  TextStyle: TextStyle;
  Background: string;
}

export interface DataGridStyleObj {
  $type: string;
  Header: DataGridHeader;
  Body: DataGridBody;
  ExportEnabled: boolean;
  ExportIconColor: string;
  OuterBorder: BorderStyle;
  InnerHorizontalBorder: BorderStyle;
  InnerVerticalBorder: BorderStyle;
  Total: DataGridTotal;
}

export interface DataGridWidget extends WidgetBase {
  Type: 'DataGrid';
  DataGridStyle: DataGridStyleObj;
  DataGridState: unknown;
  ShowGrandTotals: boolean;
}

export interface OlapTableCellStyle {
  $type: string;
  TextStyle: TextStyle;
  Background: string;
  WordWrapEnabled?: boolean;
}

export interface OlapSelectCell {
  $type: string;
  BorderColor: string;
  BackgroundColor: string;
}

export interface OlapTableStyleObj {
  $type: string;
  Header: OlapTableCellStyle;
  SidePanel: OlapTableCellStyle;
  Body: OlapTableCellStyle;
  RowTotal: OlapTableCellStyle;
  ColumnTotal: OlapTableCellStyle;
  RowGrandTotal: OlapTableCellStyle;
  ColumnGrandTotal: OlapTableCellStyle;
  SelectCell: OlapSelectCell;
  BorderStyle: { $type: string; Color: string };
}

export interface OlapTableWidget extends WidgetBase {
  Type: 'OlapTable';
  ShowRowSubTotals: boolean;
  ShowColumnSubTotals: boolean;
  ShowRowGrandTotals: boolean;
  ShowColumnGrandTotals: boolean;
  OlapTableStyle: OlapTableStyleObj;
  OlapTableState: unknown;
}

// ---- Filter widgets ----

export interface FilterTextStyle {
  $type: string;
  Color: string;
  FontSize: number;
  FontFamily: string;
  Align: number;
  VerticalAlign: number;
  LineHeight: number;
  IsBold: boolean;
  IsItalic: boolean;
}

export interface FilterWidget extends WidgetBase {
  Type: 'Filter';
  ExcludingDisplayed: boolean;
  SearchEnabled: boolean;
  BodyBackgroundColor: string;
  ResetSelectedValuesAllowed: boolean;
  ExistingInTablesEnabled: boolean;
  SelectedTables: TypedList<unknown>;
  TextFormatter: string;
  FilterTextStyle: FilterTextStyle;
  SyncGroupName: string | null;
}

export interface DateFilterWidget extends WidgetBase {
  Type: 'DateFilter';
  Range: unknown;
  DateAvailableFrom: string | null;
  DateAvailableTo: string | null;
  FilterTextStyle: FilterTextStyle;
  SyncGroupName: string | null;
}

// ---- Indicator ----

export interface IndicatorTrendDetails {
  $type: string;
  IconAlignment: number;
  IconSize: number;
  IconEnabled: boolean;
  Color: string;
  IconId: string;
  IconColor: string;
  IconMarkup: string;
  CustomIcon: unknown;
}

export interface IndicatorTrendSettings {
  $type: string;
  Direction: number;
  PositiveTrendDetails: IndicatorTrendDetails;
  NeutralTrendDetails: IndicatorTrendDetails;
  NegativeTrendDetails: IndicatorTrendDetails;
}

export interface IndicatorTargetValueDetails {
  $type: string;
  TextStyle: TextStyle;
  Label: string;
}

export interface IndicatorTargetDistanceDetails {
  $type: string;
  Enabled: boolean;
  Style: number;
  Precision: number;
  Direction: number;
  TextStyle: TextStyle;
}

export interface IndicatorTargetSettings {
  $type: string;
  Enabled: boolean;
  TargetValueDetails: IndicatorTargetValueDetails;
  TargetDistanceDetails: IndicatorTargetDistanceDetails;
}

export interface IndicatorValueSettings {
  $type: string;
  TextStyle: TextStyle;
}

export interface IndicatorWidget extends WidgetBase {
  Type: 'Indicator';
  ValueSettings: IndicatorValueSettings;
  TrendSettings: IndicatorTrendSettings;
  TargetSettings: IndicatorTargetSettings;
}

// ---- Other widget types ----

export interface TextWidgetType extends WidgetBase {
  Type: 'TextWidget';
  ContentTextStyle: TextStyle;
  ContentText: string | null;
}

export interface ImageWidgetType extends WidgetBase {
  Type: 'ImageWidget';
  Base64: string | null;
  FileGuid: string | null;
  ImageAlignment: number;
}

export interface UserWidgetType extends WidgetBase {
  Type: 'UserWidget';
  TemplateGuid: string | null;
  Properties: unknown;
  PropertiesJson: string | null;
  IsGlobal: boolean;
  WorkspaceId: string | null;
}

export interface ButtonStyle {
  $type: string;
  TextStyle: TextStyle;
  BackgroundColor: string;
  HoverBackgroundColor: string;
  BorderColor: string;
  HoverBorderColor: string;
  BorderRadius: number;
}

export interface RegularReportButtonWidget extends WidgetBase {
  Type: 'RegularReportButton';
  ButtonStyle: ButtonStyle;
  RegularReportGuid: string | null;
  ContentTextStyle: TextStyle;
  ContentText: string | null;
}

// ---- All widget types union ----

export type AnyWidget =
  | WidgetBase
  | BarChartWidget
  | ChartWidget
  | ColumnChartWidget
  | PieChartWidget
  | TreemapWidget
  | GaugeWidget
  | DataGridWidget
  | OlapTableWidget
  | FilterWidget
  | DateFilterWidget
  | IndicatorWidget
  | TextWidgetType
  | ImageWidgetType
  | UserWidgetType
  | RegularReportButtonWidget;

// All 22 widget type names
export const WIDGET_TYPES = [
  'WidgetBase',
  'BarChart',
  'Chart',
  'ColumnChart',
  'PieChart',
  'Treemap',
  'Gauge',
  'HighchartsBarChart',
  'HighchartsChart',
  'HighchartsColumnChart',
  'DateFilter',
  'Filter',
  'ImageWidget',
  'HighchartsPieChart',
  'OlapTable',
  'DataGrid',
  'TextWidget',
  'UserWidget',
  'HighchartsTreemap',
  'HighchartsGauge',
  'RegularReportButton',
  'Indicator',
] as const;

export type WidgetTypeName = (typeof WIDGET_TYPES)[number];

// ---- App-level types ----

export interface PaletteColor {
  id: string;
  role: string;
  value: string; // rgba string
}

export interface GlobalTokens {
  titleFontFamily: string;
  dataFontFamily: string;
  titleFontSize: number;
  lineHeight: number;
  borderRadius: number;
}
