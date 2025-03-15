﻿#ifndef DEBUG_H
#define DEBUG_H
/// "debug.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:
#include <functional>
#include <filesystem> /// C++17
#include <algorithm>
#include <iostream>
#include <iterator>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <memory>
#include <format>  /// C++20
#include <vector>
#include <string>
#include <cmath>
#include <list>
#include <map>
#include <set>

#include <SFML/Graphics.hpp>

namespace fs = std::filesystem;
void tests();

template<typename T> using Arr1d =       std::vector<T> ;
template<typename T> using Mat2d = Arr1d<std::vector<T>>;
template<typename T> using Mat3d = Mat2d<std::vector<T>>;

#define ln(a) std::cout << #a << ":\n" << (a) << '\n';
#define  l(a) std::cout << #a << ": "  << (a) << '\n';
#define TEST friend void ::tests(); static void test()

using Strv = std::string_view;

///----------------------------------------------------------------------------|
/// Начинка для ASSERT.
///------------------------------------------------------------------------ Ass:
constexpr char ERROR  []{ "ASSERT_ERROR--->FILE: \"{}\", LINE: {} - {}\n" };
constexpr char WARNING[]{ "WARNING--->FILE: \"{}\", LINE: {} - {}\n" };

struct  Ass
{
    static void error(bool pred, Strv filename, int line, Strv str = "...")
    {   if(!pred)
        {   std::cout << std::format(ERROR, cutStr(filename), line, str);
            throw(-1);
        }
    }

    static void warn(bool b, Strv filename, int line, Strv str)
    {   if(b)
        {   std::cout << std::format(WARNING, cutStr(filename), line, str);
        }
    }

    static Strv cutStr(Strv s)
    {   auto p = s.rfind("sources"); return s.substr(p, s.size() - p);
    }
};

#define  ASSERT(a)       Ass::error(a, __FILE__, __LINE__);
#define ASSERTM(a, mess) Ass::error(a, __FILE__, __LINE__, mess);
#define WARNING(a, mess) Ass::warn (a, __FILE__, __LINE__, mess);
#define TRY(a) try{a;}catch(...){std::cout << "ERROR exeption: " << #a << '\n';}

#endif // DEBUG_H
