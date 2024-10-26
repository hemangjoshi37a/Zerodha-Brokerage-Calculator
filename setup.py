# setup.py
from setuptools import setup, find_packages

setup(
    name='zerodha_brokerage_calculator',
    version='0.2.0',
    description='A Python package to calculate Zerodha brokerage charges for various trading segments',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    author='Hemang Joshi',
    author_email='hemangjoshi37a@gmail.com',
    url='https://github.com/hemangjoshi37a/Zerodha-Brokerage-Calculator',
    packages=find_packages(),
    classifiers=[
        'Programming Language :: Python :: 3',
        'Intended Audience :: Financial and Insurance Industry',
        'License :: OSI Approved :: MIT License',
    ],
    python_requires='>=3.6',
)
