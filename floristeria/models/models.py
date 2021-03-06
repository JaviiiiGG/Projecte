# -*- coding: utf-8 -*-

from odoo import models, fields, api, exceptions
import re

class flor_clients(models.Model): #Tabla Clients
    _name = 'floristeria.clients'

    name = fields.Char(string="Nom", required="True", help="Nom del client")
    cognom = fields.Char(string="Cognoms", required="True", help="Cognom del client")
    telefon = fields.Char(string="Telefon", default="" ,help="Telefon del client")
    mail =  fields.Char(string="e-Mail", help="Correu electrònic del client")
    comandes = fields.One2many('floristeria.comandes', 'nameClient', string='Comandes')
    
    @api.constrains('telefon') 
    def _validarTelefon(self): #Comprova si el telefon introduït es correcte
        erTelefon= "((?:\+\d{2}[-\.\s]??|\d{4}[-\.\s]??)?(?:\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4}))"
        for r in self:
            if (r.telefon and r.telefon.strip()):
                if not re.findall(erTelefon, r.telefon):
                    raise exceptions.ValidationError("El numero del telefon és incorrecte")

    
    @api.constrains('mail')
    def _validarEmail(self): #Validacio de email
        erEmail = "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"
        for r in self:
            if (r.mail and r.mail.strip()): #Strip elimina de la string la part que li passes al argument
                if not re.findall(erEmail, r.mail):
                    raise exceptions.ValidationError("Correu incorrecte")



class flor_comandes(models.Model): #Tabla Comandes
    _name = 'floristeria.comandes'

    name = fields.Char(string="Nom", help="Nom de la factura")
    nameClient = fields.Many2one("floristeria.clients", string="Client", required="True", ondelete="cascade", help="Informació del client")
    data = fields.Date(string="Data", default=lambda self: fields.Date.today())
    direccio = fields.Char(string="Direcció", help="Direcció de la encomanda si es te que portar")
    portar = fields.Boolean(string="Portar?", help="Ho portem o venen ells?")
    productes = fields.Many2many('floristeria.productes','comandes',string="Productes")
    #total = fields.Float(string='Total')
    preu = fields.Float(string='Preu', help="Preu aproximat"  ''', compute="_calcPreu"''')
    preuFinal = fields.Float(string='Preu Final', help="Preu Final")
    pagat = fields.Boolean(string='Pagat?', default=False, help="Marcat = pagat, No Marcat = No Pagat")
    tipusPago = fields.Selection([('efectiu', 'Efectiu'),('targeta', 'Targeta')], string='Tipus de Pago')
    movimentComandes = fields.Integer(string='')

    @api.onchange('portar')
    def _borrarDireccio(self):
        for r in self:
            if not r.portar:
                r.direccio=""
    
    @api.onchange('pagat')
    def _borrarPago(self):
        for r in self:
            if not r.pagat:
                r.tipusPago=""

    '''@api.depends('total','preu')
    def _calcPreu(self):
        for r in self:
           preu = r.total + preu'''
    

class flor_productes(models.Model): #Tabla Productes
    _name = 'floristeria.productes'

    name = fields.Char(string="Nom", required="True", help="Nombre del producto")
    descripcio = fields.Char(string='Descripció', help="Descripció curta sobre el producte")
    preuProducte = fields.Float(string='Preu', help="Preu del producte amb l'IVA incluït")
    imatge = fields.Binary(string='Imatge')
    comandes = fields.Many2many("floristeria.comandes",'productes', string="Comandes")
    moviment = fields.Integer(string='')

