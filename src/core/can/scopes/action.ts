export class ActionScope {
  static Create: ActionScope = new ActionScope('Create')
  static Read: ActionScope = new ActionScope('Read')
  static Update: ActionScope = new ActionScope('Update')
  static Delete: ActionScope = new ActionScope('Delete')

  constructor(public name: string) {}
}
