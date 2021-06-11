from odoo import models, fields, api
from odoo.tools import DEFAULT_SERVER_DATE_FORMAT as DATE_FORMAT
from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT as DATETIME_FORMAT

from datetime import datetime, timedelta

class ReportWizard(models.TransientModel):
    _name = 'floristeria.wizard'

    data_inici = fields.Date(string='Data Inici', required=True, default=fields.Date.today)
    data_final = fields.Date(string='Data Final', required=True, default=fields.Date.today)

    def get_report(self):
        data = {
            'model': self._name,
            'ids': self.ids,
            'form':{
                'data_inici': self.data_inici, 'data_final': self.data_final,
            }
        }
        print(data)
        return self.env.ref('floristeria.informe').report_action(self, data=data)
    
class ReportView(models.AbstractModel):
    _name = 'report.floristeria.informe_view'

    @api.model
    def _get_report_values(self, docids, data=None):
        data_inici = data['form']['data_inici']
        data_final = data['form']['data_final']

        so = self.env['floristeria.comandes']
        inici = datetime.strptime(data_inici, DATE_FORMAT)
        final = datetime.strptime(data_final, DATE_FORMAT)
        delta = timedelta(days=1)

        docs = []
        while inici <= final:
            date = inici
            inici += delta

            print(date, inici)
            comandes = so.search([
                ('data', '>=', date.strftime(DATETIME_FORMAT)),
                ('data', '<', inici.strftime(DATETIME_FORMAT)),
            ])
            comandes_totals = len(comandes)
            suma_total = sum(comanda.preuFinal for comanda in comandes)

            docs.append({
                'date': date.strftime("%d-%m-%Y"),
                'comandes_totals': comandes_totals,
                'suma_total': suma_total,
                'company': self.env.user.company_id
            })
        return {
            'doc_ids': data ['ids'],
            'doc_model': data ['model'],
            'data_inici': data_inici,
            'data_final': data_final,
            'docs': docs,
        }