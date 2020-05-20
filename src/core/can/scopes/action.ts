export class ActionScope {
  static Create: ActionScope = new ActionScope('Create')
  static Read: ActionScope = new ActionScope('Read')
  static Update: ActionScope = new ActionScope('Update')
  static Delete: ActionScope = new ActionScope('Delete')
  static All: Array<ActionScope> = [
    ActionScope.Create,
    ActionScope.Read,
    ActionScope.Update,
    ActionScope.Delete,
  ]

  constructor(public name: string) {}
}
