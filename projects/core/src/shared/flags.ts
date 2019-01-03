export const enum VNodeFlags {
  Intrinsic         = 0b00000001,
  ClassComponent    = 0b00000010,
  FunctionComponent = 0b00000100,
  Text              = 0b00001000,
  Void              = 0b00010000,
  AngularComponent  = 0b00100000,

  Simple            = Intrinsic | Text | Void,
}
