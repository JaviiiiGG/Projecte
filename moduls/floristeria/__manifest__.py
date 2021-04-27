# -*- coding: utf-8 -*-
{
    'name': "Floristeria",

    'summary': """
        Mòdul per a la gestió d'una floristeria.
        Controla els clients, els productes, les encomandes, etc.""",

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
        # 'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
}
