export interface Historia
{
    id: number;
    especialidad: string;
    altura: string;
    peso: string;
    temperatura: string;
    presion: string;
    email_paciente: string;
    email_especialista: string;
    fecha: string;
    datosDinamicos: DatosDinamicos[];
}

export interface DatosDinamicos
{
    id: string;
    clave: string;
    valor: string;
    email_paciente: string;
    fecha: string;
}