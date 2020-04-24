interface User {
  id: string
  roles: Array<Role>
  permissions: Array<Permission>
}

interface Role {
  id: string
  name: string
  permissions: Array<Permission>
}

interface Permission {
  id: string
  name: string
}

interface Model {
  name: string
  fields: Array<Field>
}

interface FieldType {
  name: String
}

interface Field {
  name: string
  type: FieldType,
  canBeModifiedBy: Array<Permission>,
  canBeEditedBy: Array<Permission>,
}

export interface ClassType<T = any> {
  new (...args: any[]): T;
}

const can = {
  create(entity: ClassType): Ask {
    return {
      action: ActionType.Create,
      entity,
    }
  }
}

const hello = (name: string) => {
  console.log("hello")
}

enum ActionType {
  Create,
  Read,
  Update,
  Delete,
  Other
}

interface Ask {
  action: ActionType,
  entity: ClassType
}

export const run = async () => {
  hello("friend")
}

// Field has to be Accessible to be Editable
