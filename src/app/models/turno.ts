export interface Turno
{
    id: string;
    fecha: string;
    email_esp: string;
    especialidad: string;
    email_paciente: string;
    estado: string;
    comentario: string;
    calificacion: string;
    users: {firstname:string, surname:string}
}

export class Turno
{
    fecha: string;
    email_esp: string;
    especialidad: string;
    email_paciente: string;
    estado: string;
    comentario: string;
    firstname:string;
    surname:string;
    calificacion:string;
    historia:string|null;

    constructor(fecha:string, emailEsp:string, emailPaciente:string, especialidad:string, estado:string, comentario:string, firstname:string, surname:string, calificaion:string, historia:string|null = null)
    {
        this.fecha = fecha;
        this.email_esp = emailEsp;
        this.especialidad = especialidad;
        this.email_paciente = emailPaciente;
        this.estado = estado;
        this.comentario = comentario;
        this.firstname = firstname;
        this.surname = surname;
        this.calificacion = calificaion;
        this.historia = historia;
    }

}