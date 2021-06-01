from odoo import models, fields, api

class Wizard(models.TransientModel):
    _name = 'floristeria.wizard'

    def _default_comandes(self):
        return self.env['floristeria.comandes'].browse(self._context.get('active_ids'))
    def _default_preu_producte(self):
        return self.env['floristeria.productes'].browse(self._context.get('preuProducte'))
    #def _default_nom_producte(self):
    #    return self.env['floristeria.productes'].browse(self._context.get('name'))


    comandesWizard = fields.Many2one('floristeria.comandes', string="Comandes", default=_default_comandes)
    #nomProducte = fields.Many2many('floristeria.productes', string="Nom Producte", default=_default_nom_producte)
    preuProducte = fields.Many2many('floristeria.productes', string="Preu Producte", default=_default_preu_producte)

    
