export class Pleagan {
  id: string;
  name: string;
  email: string;
  message?: string;
  location?: string;

  constructor(id: string, name: string, email: string, message?: string, location?: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.message = message || undefined;
    this.location = location || undefined;
  }
}
