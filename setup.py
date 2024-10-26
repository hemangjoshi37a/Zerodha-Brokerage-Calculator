# setup.py
from setuptools import setup, find_packages

setup(
    name='zerodha_brokerage_calculator',
    version='0.1.0',
    description='A Python package to calculate Zerodha brokerage charges for various trading segments',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    author='Your Name',
    author_email='your.email@example.com',
    url='https://github.com/yourusername/zerodha_brokerage_calculator',
    packages=find_packages(),
    classifiers=[
        'Programming Language :: Python :: 3',
        'Intended Audience :: Financial and Insurance Industry',
        'License :: OSI Approved :: MIT License',
    ],
    python_requires='>=3.6',
)
