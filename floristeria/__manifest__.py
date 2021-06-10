# -*- coding: utf-8 -*-
{
    'name': "Floristeria",

    'summary': """
        Mòdul per a la gestió d'una floristeria.
        Controla els clients, els productes, les comandes, etc.""",

    'description': "",

    'author': "Javier García",
    'website': "http://www.florsdevoramar.es",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/13.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Administración',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/reports.xml'
        'views/views.xml',
        'views/templates.xml',
        'data/data.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
}
